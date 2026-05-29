import { ExperienceEntry } from './ExperienceSection';
import { EducationEntry } from './EducationSection';
import { ProjectEntry } from './ProjectsSection';
import { ResearchEntry } from './ResearchSection';
import { Skill } from './SkillsSection';

export interface LegacyCVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

export interface LanguageEntry {
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface AwardEntry {
  title: string;
  issuer: string;
  date?: string;
}

export interface StructuredCVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    professionalTitle?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects?: ProjectEntry[];
  research?: ResearchEntry[];
  skills: Skill[];
  languages?: LanguageEntry[];
  awards?: AwardEntry[];
  sectionTitles?: {
    summary?: string;
    experience?: string;
    education?: string;
    projects?: string;
    skills?: string;
    research?: string;
    languages?: string;
    awards?: string;
  };
}

export interface TemplateProps {
  data: LegacyCVData | StructuredCVData;
}

export function isStructuredData(data: LegacyCVData | StructuredCVData): data is StructuredCVData {
  return 'personalInfo' in data;
}

export function parseBulletPoints(description: string): string[] {
  if (!description) return [];
  return description
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-•*]\s*/, ''));
}

export function normalizeCVData(data: LegacyCVData | StructuredCVData): StructuredCVData {
  if (isStructuredData(data)) return data;

  return {
    personalInfo: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      location: data.location,
    },
    summary: data.summary,
    experience: data.experience
      ? data.experience.split('\n').filter(e => e.trim()).map((exp, idx) => ({
          id: `exp-${idx}`,
          jobTitle: exp.trim(),
          employer: '',
          startDate: '',
          endDate: '',
          location: '',
          description: '',
          isVisible: true,
        }))
      : [],
    education: data.education
      ? data.education.split('\n').filter(e => e.trim()).map((edu, idx) => ({
          id: `edu-${idx}`,
          school: edu.trim(),
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          location: '',
          description: '',
          isVisible: true,
        }))
      : [],
    skills: data.skills
      ? data.skills.split(',').filter(s => s.trim()).map((skill, idx) => ({
          id: `skill-${idx}`,
          name: skill.trim(),
        }))
      : [],
  };
}
