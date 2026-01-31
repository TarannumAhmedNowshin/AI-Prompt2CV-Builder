'use client';

import { ExperienceEntry } from './ExperienceSection';
import { EducationEntry } from './EducationSection';
import { ProjectEntry } from './ProjectsSection';
import { ResearchEntry } from './ResearchSection';
import { Skill } from './SkillsSection';

// Legacy data format for backward compatibility
interface LegacyCVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

// New structured data format
interface StructuredCVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects?: ProjectEntry[];
  research?: ResearchEntry[];
  skills: Skill[];
  sectionTitles?: {
    summary?: string;
    experience?: string;
    education?: string;
    projects?: string;
    skills?: string;
    research?: string;
  };
}

interface ClassicTemplateProps {
  data: LegacyCVData | StructuredCVData;
}

// Helper to check if data is structured format
function isStructuredData(data: LegacyCVData | StructuredCVData): data is StructuredCVData {
  return 'personalInfo' in data;
}

// Helper to parse bullet points from description
function parseBulletPoints(description: string): string[] {
  if (!description) return [];
  return description
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-•*]\s*/, ''));
}

export default function ClassicTemplate({ data }: ClassicTemplateProps) {
  // Normalize data to structured format
  const normalizedData: StructuredCVData = isStructuredData(data)
    ? data
    : {
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

  const { personalInfo, summary, experience, education, skills, projects, research } = normalizedData;
  const sectionTitles = normalizedData.sectionTitles || {};
  
  const visibleExperience = experience.filter(e => e.isVisible !== false);
  const visibleEducation = education.filter(e => e.isVisible !== false);
  const visibleProjects = projects?.filter(p => p.isVisible !== false) || [];
  const visibleResearch = research?.filter(r => r.isVisible !== false) || [];

  return (
    <div className="cv-print-optimized bg-white shadow-lg" style={{ width: '100%', maxWidth: '850px', minHeight: '1100px', margin: '0 auto', fontFamily: 'Times New Roman, serif', padding: '2.5rem' }}>
      {/* Header Section - Classic Jacob McLaren style */}
      <div className="text-center mb-4 pb-2 border-b border-gray-400">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex justify-center flex-wrap items-center gap-2 text-sm text-gray-700">
          {personalInfo.location && (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{personalInfo.location}</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span className="text-gray-400 mx-1">|</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>{personalInfo.email}</span>
            </>
          )}
          {personalInfo.phone && (
            <>
              <span className="text-gray-400 mx-1">|</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>{personalInfo.phone}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.summary || 'Summary'}
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed text-justify">
            {summary}
          </p>
        </div>
      )}

      {/* Education Section */}
      {visibleEducation.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.education || 'Education'}
          </h2>
          <div className="space-y-3">
            {visibleEducation.map((edu) => (
              <div key={edu.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900 uppercase">{edu.school || 'Institution Name'}</span>
                    {edu.location && (
                      <span className="text-gray-700">, {edu.location}</span>
                    )}
                  </div>
                  <span className="text-gray-700 whitespace-nowrap ml-4">
                    {edu.endDate || edu.startDate || ''}
                  </span>
                </div>
                {(edu.degree || edu.field) && (
                  <p className="text-gray-700 italic">
                    {edu.degree}{edu.degree && edu.field ? ', ' : ''}{edu.field}
                    {edu.gpa && <span> | GPA: {edu.gpa}</span>}
                  </p>
                )}
                {edu.description && (
                  <ul className="list-disc list-outside ml-4 text-gray-700 mt-1 space-y-0.5">
                    {parseBulletPoints(edu.description).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience Section */}
      {visibleExperience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.experience || 'Work Experience'}
          </h2>
          <div className="space-y-4">
            {visibleExperience.map((exp) => (
              <div key={exp.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900 uppercase">{exp.employer || 'Company Name'}</span>
                    {exp.location && (
                      <span className="text-gray-700">, {exp.location}</span>
                    )}
                  </div>
                  <span className="text-gray-700 whitespace-nowrap ml-4">
                    {exp.startDate && exp.endDate 
                      ? `${exp.startDate} – ${exp.endDate}` 
                      : exp.startDate || exp.endDate || ''}
                  </span>
                </div>
                {exp.jobTitle && (
                  <p className="text-gray-700 italic">{exp.jobTitle}</p>
                )}
                {exp.description && (
                  <ul className="list-disc list-outside ml-4 text-gray-700 mt-1 space-y-0.5">
                    {parseBulletPoints(exp.description).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {visibleProjects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.projects || 'Projects'}
          </h2>
          <div className="space-y-3">
            {visibleProjects.map((project) => (
              <div key={project.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900">{project.name}</span>
                    {project.technologies && (
                      <span className="text-gray-600 text-xs ml-2">({project.technologies})</span>
                    )}
                  </div>
                  <span className="text-gray-700 whitespace-nowrap ml-4">
                    {project.startDate && project.endDate 
                      ? `${project.startDate} – ${project.endDate}` 
                      : project.startDate || project.endDate || ''}
                  </span>
                </div>
                {project.description && (
                  <ul className="list-disc list-outside ml-4 text-gray-700 mt-1 space-y-0.5">
                    {parseBulletPoints(project.description).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Section */}
      {visibleResearch.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.research || 'Research & Publications'}
          </h2>
          <div className="space-y-3">
            {visibleResearch.map((entry) => (
              <div key={entry.id} className="text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-gray-900">{entry.title}</span>
                    {entry.publisher && (
                      <span className="text-gray-700">, {entry.publisher}</span>
                    )}
                  </div>
                  <span className="text-gray-700 whitespace-nowrap ml-4">
                    {entry.date || ''}
                  </span>
                </div>
                {entry.authors && (
                  <p className="text-gray-600 text-xs italic">Authors: {entry.authors}</p>
                )}
                {entry.description && (
                  <ul className="list-disc list-outside ml-4 text-gray-700 mt-1 space-y-0.5">
                    {parseBulletPoints(entry.description).map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Expertise / Skills Section */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.skills || 'Technical Expertise'}
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {skills.map(s => s.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
