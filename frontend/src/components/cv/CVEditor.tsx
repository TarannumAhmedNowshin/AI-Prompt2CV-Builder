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
}

export default function CVEditor({
  data,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: CVEditorProps) {
  const [aiPrompt, setAiPrompt] = useState('');

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    await onAIGenerate(aiPrompt);
    setAiPrompt('');
  };

  return (
    <div className="space-y-4">
      {/* AI Assistant Card */}
      <Card title="AI Assistant" subtitle="Use AI to generate content for your CV">
        <div className="space-y-4">
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Describe your experience, skills, or what you want to include in your CV..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <Button
            onClick={handleAIGenerate}
            isLoading={isGenerating}
            fullWidth
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Generate with AI
          </Button>
        </div>
      </Card>

      {/* CV Title */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
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
}): CVEditorData {
  // Parse experience from text
  const experienceEntries: ExperienceEntry[] = legacyData.experience
    ? legacyData.experience.split('\n').filter(e => e.trim()).map((exp, idx) => ({
        id: `exp-${idx}`,
        jobTitle: exp.trim(),
        employer: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        isVisible: true,
      }))
    : [];

  // Parse education from text
  const educationEntries: EducationEntry[] = legacyData.education
    ? legacyData.education.split('\n').filter(e => e.trim()).map((edu, idx) => ({
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
    projects: [],
    skills: skillsList,
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
  };
}
