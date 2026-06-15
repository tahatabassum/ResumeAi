export interface ResumeMeta {
  id: string | null;
  name: string;
  templateId: string;
  skillDisplayMode: 'bars' | 'stars' | 'dots';
  showPhoto: boolean;
  accentColor: string;
  lastSaved: string | null;
}

export interface PersonalInfo {
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  photo: string | null; // Base64 image
}

export interface SummaryInfo {
  text: string;
  tone: 'professional' | 'friendly' | 'confident';
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  current: boolean;
  gpa: string;
  achievements: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'tools' | 'design' | 'data';
}

export interface ProjectEntry {
  id: string;
  name: string;
  type: 'personal' | 'academic' | 'freelance' | 'open-source' | 'hackathon';
  description: string;
  techStack: string[];
  liveUrl: string;
  sourceUrl: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export interface ResumeData {
  meta: ResumeMeta;
  personal: PersonalInfo;
  summary: SummaryInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
  interests: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}
