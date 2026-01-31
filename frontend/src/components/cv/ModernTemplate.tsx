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

// Language entry for CV
interface LanguageEntry {
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

// Award entry for CV
interface AwardEntry {
  title: string;
  issuer: string;
  date?: string;
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

interface ModernTemplateProps {
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

export default function ModernTemplate({ data }: ModernTemplateProps) {
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

  const { personalInfo, summary, experience, education, skills, projects, research, languages, awards } = normalizedData;
  const sectionTitles = normalizedData.sectionTitles || {};
  
  const visibleExperience = experience.filter(e => e.isVisible !== false);
  const visibleEducation = education.filter(e => e.isVisible !== false);
  const visibleProjects = projects?.filter(p => p.isVisible !== false) || [];
  const visibleResearch = research?.filter(r => r.isVisible !== false) || [];

  return (
    <div className="cv-print-optimized bg-white shadow-lg" style={{ width: '100%', maxWidth: '850px', minHeight: '1100px', margin: '0 auto', fontFamily: 'Georgia, serif', padding: '2rem 2.5rem' }}>
      {/* Header Section - Clean professional style like Jacob McLaren */}
      <div className="text-center mb-5 pb-3 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 tracking-wide mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        
        {/* Contact Info Row - Clean horizontal layout */}
        <div className="flex justify-center flex-wrap items-center gap-4 text-sm text-gray-600">
          {personalInfo.location && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.email && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
              <span>{personalInfo.linkedin}</span>
            </span>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.summary || 'Summary'}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Education Section - Jacob McLaren style */}
      {visibleEducation.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-400 pb-1">
            {sectionTitles.education || 'Education'}
          </h2>
          <div className="space-y-4">
            {visibleEducation.map((edu) => (
              <div key={edu.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-gray-900 uppercase">{edu.school || 'Institution'}</span>
                    {edu.location && (
                      <span className="text-gray-600">, </span>
                    )}
                  </div>
                  <span className="text-gray-600 whitespace-nowrap ml-4">
                    {edu.endDate || edu.startDate || ''}
                  </span>
                </div>
                {(edu.degree || edu.field) && (
                  <p className="text-gray-700 italic">
                    {edu.degree}{edu.degree && edu.field ? ', ' : ''}{edu.field}
                    {edu.gpa && <span className="text-gray-600"> | GPA: {edu.gpa}</span>}
                  </p>
                )}
                {edu.description && (
                  <ul className="mt-1.5 space-y-0.5">
                    {parseBulletPoints(edu.description).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-gray-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience Section - Clean professional format */}
      {visibleExperience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-400 pb-1">
            {sectionTitles.experience || 'Work Experience'}
          </h2>
          <div className="space-y-4">
            {visibleExperience.map((exp) => (
              <div key={exp.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-gray-900 uppercase">{exp.employer || 'Company'}</span>
                    {exp.location && (
                      <span className="text-gray-600">,</span>
                    )}
                  </div>
                  <div className="text-right whitespace-nowrap ml-4">
                    <span className="text-gray-600">
                      {exp.startDate && exp.endDate 
                        ? `${exp.startDate} – ${exp.endDate}` 
                        : exp.startDate || exp.endDate || ''}
                    </span>
                    {exp.location && (
                      <span className="text-gray-600"> | {exp.location}</span>
                    )}
                  </div>
                </div>
                {exp.jobTitle && (
                  <p className="text-gray-700 italic">{exp.jobTitle}</p>
                )}
                {exp.description && (
                  <ul className="mt-1.5 space-y-0.5">
                    {parseBulletPoints(exp.description).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-gray-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Experience */}
      {visibleResearch.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-400 pb-1">
            {sectionTitles.research || 'Research Experience'}
          </h2>
          <div className="space-y-4">
            {visibleResearch.map((entry) => (
              <div key={entry.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-gray-900">{entry.title}</span>
                    {entry.publisher && (
                      <span className="text-gray-600">, <span className="italic">{entry.publisher}</span></span>
                    )}
                  </div>
                  <span className="text-gray-600 whitespace-nowrap ml-4">
                    {entry.date}
                  </span>
                </div>
                {entry.authors && (
                  <p className="text-gray-600 text-xs italic mb-1">Authors: {entry.authors}</p>
                )}
                {entry.description && (
                  <ul className="mt-1.5 space-y-0.5">
                    {parseBulletPoints(entry.description).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-gray-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
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
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-400 pb-1">
            {sectionTitles.projects || 'Projects'}
          </h2>
          <div className="space-y-4">
            {visibleProjects.map((project) => (
              <div key={project.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-gray-900">{project.name}</span>
                    {project.technologies && (
                      <span className="text-gray-500 text-xs ml-2">({project.technologies})</span>
                    )}
                  </div>
                  <span className="text-gray-600 whitespace-nowrap ml-4">
                    {project.startDate && project.endDate 
                      ? `${project.startDate} – ${project.endDate}` 
                      : project.startDate || project.endDate || ''}
                  </span>
                </div>
                {project.description && (
                  <ul className="mt-1.5 space-y-0.5">
                    {parseBulletPoints(project.description).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-gray-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {project.link && (
                  <p className="text-gray-600 text-xs mt-1">
                    <span className="font-medium">Link:</span> {project.link}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Expertise / Skills - Single line format like Jacob McLaren */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.skills || 'Technical Expertise'}
          </h2>
          <p className="text-sm text-gray-700">
            {skills.map(s => s.name).join(', ')}
          </p>
        </div>
      )}

      {/* Languages Section */}
      {languages && languages.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.languages || 'Languages'}
          </h2>
          <p className="text-sm text-gray-700">
            {languages.map(l => `${l.name} (${l.proficiency})`).join(' • ')}
          </p>
        </div>
      )}

      {/* Awards Section */}
      {awards && awards.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-400 pb-1">
            {sectionTitles.awards || 'Awards & Honors'}
          </h2>
          <div className="space-y-1">
            {awards.map((award, idx) => (
              <div key={idx} className="text-sm flex justify-between">
                <div>
                  <span className="font-medium text-gray-900">{award.title}</span>
                  <span className="text-gray-600"> – {award.issuer}</span>
                </div>
                {award.date && (
                  <span className="text-gray-600 whitespace-nowrap ml-4">{award.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
