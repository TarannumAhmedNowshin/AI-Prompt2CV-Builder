'use client';

import React from 'react';
import PersonalInfoSection from './PersonalInfoSection';
import SummarySection from './SummarySection';
import ExperienceSection, { ExperienceEntry } from './ExperienceSection';
import EducationSection, { EducationEntry } from './EducationSection';
import ProjectsSection, { ProjectEntry } from './ProjectsSection';
import SkillsSection, { Skill } from './SkillsSection';
import ResearchSection, { ResearchEntry } from './ResearchSection';

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
  onChange: (update: CVEditorData | ((prev: CVEditorData) => CVEditorData)) => void;
}

export default function CVEditor({ data, onChange }: CVEditorProps) {
  return (
    <div className="space-y-5">
      <PersonalInfoSection
        data={data.personalInfo}
        onChange={(personalInfo) => onChange(prev => ({ ...prev, personalInfo }))}
      />

      <SummarySection
        summary={data.summary}
        sectionTitle={data.sectionTitles.summary}
        onSummaryChange={(summary) => onChange(prev => ({ ...prev, summary }))}
        onTitleChange={(title) =>
          onChange(prev => ({
            ...prev,
            sectionTitles: { ...prev.sectionTitles, summary: title },
          }))
        }
      />

      <EducationSection
        entries={data.education}
        sectionTitle={data.sectionTitles.education}
        onEntriesChange={(education) => onChange(prev => ({ ...prev, education }))}
        onTitleChange={(title) =>
          onChange(prev => ({
            ...prev,
            sectionTitles: { ...prev.sectionTitles, education: title },
          }))
        }
      />

      <ExperienceSection
        entries={data.experience}
        sectionTitle={data.sectionTitles.experience}
        onEntriesChange={(experience) => onChange(prev => ({ ...prev, experience }))}
        onTitleChange={(title) =>
          onChange(prev => ({
            ...prev,
            sectionTitles: { ...prev.sectionTitles, experience: title },
          }))
        }
      />

      <ProjectsSection
        entries={data.projects}
        sectionTitle={data.sectionTitles.projects}
        onEntriesChange={(projects) => onChange(prev => ({ ...prev, projects }))}
        onTitleChange={(title) =>
          onChange(prev => ({
            ...prev,
            sectionTitles: { ...prev.sectionTitles, projects: title },
          }))
        }
      />

      <SkillsSection
        skills={data.skills}
        sectionTitle={data.sectionTitles.skills}
        onSkillsChange={(skills) => onChange(prev => ({ ...prev, skills }))}
        onTitleChange={(title) =>
          onChange(prev => ({
            ...prev,
            sectionTitles: { ...prev.sectionTitles, skills: title },
          }))
        }
      />

      <ResearchSection
        entries={data.research}
        sectionTitle={data.sectionTitles.research}
        onEntriesChange={(research) => onChange(prev => ({ ...prev, research }))}
        onTitleChange={(title) =>
          onChange(prev => ({
            ...prev,
            sectionTitles: { ...prev.sectionTitles, research: title },
          }))
        }
      />
    </div>
  );
}

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
