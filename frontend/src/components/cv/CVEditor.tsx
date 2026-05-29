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
