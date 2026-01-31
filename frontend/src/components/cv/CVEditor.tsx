'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PersonalInfoSection from './PersonalInfoSection';
import SummarySection from './SummarySection';
import ExperienceSection, { ExperienceEntry } from './ExperienceSection';
import EducationSection, { EducationEntry } from './EducationSection';
import ProjectsSection, { ProjectEntry } from './ProjectsSection';
import SkillsSection, { Skill } from './SkillsSection';
import ResearchSection, { ResearchEntry } from './ResearchSection';
import JobSuggestions from './JobSuggestions';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Types for the CV data structure
export interface CVEditorData {
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    photo?: string;
    linkedin?: string;
    website?: string;
    professionalTitle?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: Skill[];
  research: ResearchEntry[];
  sectionTitles: {
    summary: string;
    experience: string;
    education: string;
    projects: string;
    skills: string;
    research: string;
  };
}

interface CVEditorProps {
  data: CVEditorData;
  onChange: (data: CVEditorData) => void;
  onAIGenerate: (prompt: string) => Promise<void>;
  isGenerating?: boolean;
  cvId?: string | number;
}

export default function CVEditor({
  data,
  onChange,
  onAIGenerate,
  isGenerating = false,
  cvId,
}: CVEditorProps) {
  const [aiPrompt, setAiPrompt] = useState('');

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    await onAIGenerate(aiPrompt);
    setAiPrompt('');
  };

  return (
    <div className="space-y-5">
      {/* AI Assistant Card */}
      <Card title="AI Assistant" subtitle="Use AI to generate content for your CV" variant="elevated">
        <div className="space-y-4">
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-500 focus:bg-white resize-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
            rows={3}
            placeholder="Describe your experience, skills, or what you want to include in your CV..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <Button
            onClick={handleAIGenerate}
            isLoading={isGenerating}
            fullWidth
            className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generate with AI</span>
          </Button>
        </div>
      </Card>

      {/* Job Match Advisor */}
      {cvId && <JobSuggestions cvId={cvId} />}

      {/* CV Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <Input
          label="CV Title"
          name="title"
          placeholder="e.g., Software Engineer Resume"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          required
        />
      </div>

      {/* Personal Info Section */}
      <PersonalInfoSection
        data={data.personalInfo}
        onChange={(personalInfo) => onChange({ ...data, personalInfo })}
      />

      {/* Summary Section */}
      <SummarySection
        summary={data.summary}
        sectionTitle={data.sectionTitles.summary}
        onSummaryChange={(summary) => onChange({ ...data, summary })}
        onTitleChange={(title) =>
          onChange({
            ...data,
            sectionTitles: { ...data.sectionTitles, summary: title },
          })
        }
      />

      {/* Education Section */}
      <EducationSection
        entries={data.education}
        sectionTitle={data.sectionTitles.education}
        onEntriesChange={(education) => onChange({ ...data, education })}
        onTitleChange={(title) =>
          onChange({
            ...data,
            sectionTitles: { ...data.sectionTitles, education: title },
          })
        }
      />

      {/* Experience Section */}
      <ExperienceSection
        entries={data.experience}
        sectionTitle={data.sectionTitles.experience}
        onEntriesChange={(experience) => onChange({ ...data, experience })}
        onTitleChange={(title) =>
          onChange({
            ...data,
            sectionTitles: { ...data.sectionTitles, experience: title },
          })
        }
      />

      {/* Projects Section */}
      <ProjectsSection
        entries={data.projects}
        sectionTitle={data.sectionTitles.projects}
        onEntriesChange={(projects) => onChange({ ...data, projects })}
        onTitleChange={(title) =>
          onChange({
            ...data,
            sectionTitles: { ...data.sectionTitles, projects: title },
          })
        }
      />

      {/* Skills Section */}
      <SkillsSection
        skills={data.skills}
        sectionTitle={data.sectionTitles.skills}
        onSkillsChange={(skills) => onChange({ ...data, skills })}
        onTitleChange={(title) =>
          onChange({
            ...data,
            sectionTitles: { ...data.sectionTitles, skills: title },
          })
        }
      />

      {/* Research & Publications Section */}
      <ResearchSection
        entries={data.research}
        sectionTitle={data.sectionTitles.research}
        onEntriesChange={(research) => onChange({ ...data, research })}
        onTitleChange={(title) =>
          onChange({
            ...data,
            sectionTitles: { ...data.sectionTitles, research: title },
          })
        }
      />
    </div>
  );
}

// Helper function to create empty CV data
export function createEmptyCVData(): CVEditorData {
  return {
    title: '',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    research: [],
    sectionTitles: {
      summary: 'Professional Summary',
      experience: 'Professional Experience',
      education: 'Education',
      projects: 'Projects',
      skills: 'Skills',
      research: 'Research Experience and Publication',
    },
  };
}

// Helper function to convert legacy CV data to new format
export function convertLegacyCVData(legacyData: {
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects?: string;
  research?: string;
}): CVEditorData {
  // Parse experience from text
  const experienceEntries: ExperienceEntry[] = legacyData.experience
    ? legacyData.experience.split('\n\n').filter(e => e.trim()).map((exp, idx) => {
        const lines = exp.split('\n');
        const firstLine = lines[0] || '';
        return {
          id: `exp-${idx}`,
          jobTitle: firstLine.trim(),
          employer: '',
          startDate: '',
          endDate: '',
          location: '',
          description: lines.slice(1).join('\n').trim(),
          isVisible: true,
        };
      })
    : [];

  // Parse projects from text
  const projectEntries: ProjectEntry[] = legacyData.projects
    ? legacyData.projects.split('\n\n').filter(p => p.trim()).map((proj, idx) => {
        const lines = proj.split('\n');
        const firstLine = lines[0] || '';
        return {
          id: `proj-${idx}`,
          name: firstLine.trim(),
          startDate: '',
          endDate: '',
          technologies: '',
          description: lines.slice(1).join('\n').trim(),
          link: '',
          isVisible: true,
        };
      })
    : [];

  // Parse research from text
  const researchEntries: ResearchEntry[] = legacyData.research
    ? legacyData.research.split('\n\n').filter(r => r.trim()).map((res, idx) => {
        const lines = res.split('\n');
        const firstLine = lines[0] || '';
        return {
          id: `res-${idx}`,
          title: firstLine.trim(),
          publisher: '',
          date: '',
          authors: '',
          description: lines.slice(1).join('\n').trim(),
          link: '',
          isVisible: true,
        };
      })
    : [];

  // Parse education from text
  const educationEntries: EducationEntry[] = legacyData.education
    ? legacyData.education.split('\n\n').filter(e => e.trim()).map((edu, idx) => {
        const lines = edu.split('\n');
        const firstLine = lines[0] || '';
        return {
          id: `edu-${idx}`,
          school: '',
          degree: firstLine.trim(),
          field: '',
          startDate: '',
          endDate: '',
          location: '',
          description: lines.slice(1).join('\n').trim(),
          isVisible: true,
        };
      })
    : [];

  // Parse skills from comma-separated text
  const skillsList: Skill[] = legacyData.skills
    ? legacyData.skills.split(',').filter(s => s.trim()).map((skill, idx) => ({
        id: `skill-${idx}`,
        name: skill.trim(),
      }))
    : [];

  return {
    title: legacyData.title,
    personalInfo: {
      fullName: legacyData.fullName,
      email: legacyData.email,
      phone: legacyData.phone,
      location: legacyData.location,
    },
    summary: legacyData.summary,
    experience: experienceEntries,
    education: educationEntries,
    projects: projectEntries,
    skills: skillsList,
    research: researchEntries,
    sectionTitles: {
      summary: 'Professional Summary',
      experience: 'Professional Experience',
      education: 'Education',
      projects: 'Projects',
      skills: 'Skills',
      research: 'Research Experience and Publication',
    },
  };
}

// Helper function to convert new format back to legacy format for API
export function convertToLegacyFormat(data: CVEditorData): {
  title: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  research: string;
} {
  // Convert experience entries to text
  const experienceText = data.experience
    .filter(e => e.isVisible)
    .map(e => {
      const parts = [e.jobTitle];
      if (e.employer) parts.push(`at ${e.employer}`);
      if (e.startDate || e.endDate) parts.push(`(${e.startDate} - ${e.endDate})`);
      if (e.location) parts.push(`| ${e.location}`);
      if (e.description) parts.push(`\n${e.description}`);
      return parts.join(' ');
    })
    .join('\n\n');

  // Convert projects to text
  const projectsText = data.projects
    .filter(p => p.isVisible)
    .map(p => {
      const parts = [p.name];
      if (p.startDate || p.endDate) parts.push(`(${p.startDate} - ${p.endDate})`);
      if (p.technologies) parts.push(`| Technologies: ${p.technologies}`);
      if (p.description) parts.push(`\n${p.description}`);
      if (p.link) parts.push(`\nLink: ${p.link}`);
      return parts.join(' ');
    })
    .join('\n\n');

  // Convert research to text
  const researchText = data.research
    .filter(r => r.isVisible)
    .map(r => {
      const parts = [r.title];
      if (r.publisher) parts.push(`| ${r.publisher}`);
      if (r.date) parts.push(`(${r.date})`);
      if (r.authors) parts.push(`\nAuthors: ${r.authors}`);
      if (r.description) parts.push(`\n${r.description}`);
      if (r.link) parts.push(`\nLink: ${r.link}`);
      return parts.join(' ');
    })
    .join('\n\n');

  // Convert education entries to text
  const educationText = data.education
    .filter(e => e.isVisible)
    .map(e => {
      const parts = [e.degree];
      if (e.field) parts.push(`in ${e.field}`);
      if (e.school) parts.push(`from ${e.school}`);
      if (e.startDate || e.endDate) parts.push(`(${e.startDate} - ${e.endDate})`);
      if (e.gpa) parts.push(`| GPA: ${e.gpa}`);
      if (e.description) parts.push(`\n${e.description}`);
      return parts.join(' ');
    })
    .join('\n\n');

  // Convert skills to comma-separated text
  const skillsText = data.skills.map(s => s.name).join(', ');

  return {
    title: data.title,
    full_name: data.personalInfo.fullName,
    email: data.personalInfo.email,
    phone: data.personalInfo.phone,
    location: data.personalInfo.location,
    summary: data.summary,
    experience: experienceText,
    education: educationText,
    skills: skillsText,
    projects: projectsText,
    research: researchText,
  };
}
