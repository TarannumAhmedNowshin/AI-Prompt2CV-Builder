'use client';

import { TemplateProps, normalizeCVData, parseBulletPoints } from './templateUtils';

export default function ExecutiveTemplate({ data }: TemplateProps) {
  const cv = normalizeCVData(data);
  const { personalInfo, summary, experience, education, skills, projects, research, languages, awards } = cv;
  const t = cv.sectionTitles || {};

  const visibleExperience = experience.filter(e => e.isVisible !== false);
  const visibleEducation = education.filter(e => e.isVisible !== false);
  const visibleProjects = projects?.filter(p => p.isVisible !== false) || [];
  const visibleResearch = research?.filter(r => r.isVisible !== false) || [];

  const professionalTitle = personalInfo.professionalTitle || visibleExperience[0]?.jobTitle || '';

  return (
    <div
      className="cv-print-optimized bg-white shadow-lg font-sans"
      style={{ width: '100%', maxWidth: '850px', minHeight: '1100px', margin: '0 auto', display: 'flex' }}
    >
      {/* Sidebar */}
      <div
        className="flex-shrink-0"
        style={{
          width: '240px',
          backgroundColor: 'var(--cv-executive-accent)',
          padding: '2rem 1.25rem',
          color: '#f9fafb',
        }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white leading-tight mb-1">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          {professionalTitle && (
            <p className="text-xs text-gray-300 uppercase tracking-widest mt-1">{professionalTitle}</p>
          )}
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Contact</h3>
          <div className="space-y-1.5 text-xs text-gray-300">
            {personalInfo.email && <p>{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
            {personalInfo.website && <p>{personalInfo.website}</p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {t.skills || 'Skills'}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={skill.id || idx}
                  className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 text-gray-200"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {t.languages || 'Languages'}
            </h3>
            <div className="space-y-1 text-xs text-gray-300">
              {languages.map((l, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{l.name}</span>
                  <span className="text-gray-400 capitalize">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
              {t.awards || 'Awards'}
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              {awards.map((award, idx) => (
                <div key={idx}>
                  <p className="font-medium text-white">{award.title}</p>
                  <p className="text-gray-400">{award.issuer}{award.date ? `, ${award.date}` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1" style={{ padding: '2rem 1.75rem' }}>
        {/* Summary */}
        {summary && (
          <div className="cv-section mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-1.5 pb-1" style={{ color: 'var(--cv-executive-accent)' }}>
              {t.summary || 'Profile'}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {visibleExperience.length > 0 && (
          <div className="cv-section mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1" style={{ color: 'var(--cv-executive-accent)' }}>
              {t.experience || 'Experience'}
            </h2>
            <div className="space-y-3">
              {visibleExperience.map((exp) => (
                <div key={exp.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">{exp.jobTitle || 'Position'}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                      {exp.startDate && exp.endDate
                        ? `${exp.startDate} – ${exp.endDate}`
                        : exp.startDate || exp.endDate || ''}
                    </span>
                  </div>
                  {exp.employer && (
                    <p className="text-gray-600 text-sm">
                      {exp.employer}{exp.location ? ` — ${exp.location}` : ''}
                    </p>
                  )}
                  {exp.description && (
                    <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-700">
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

        {/* Education */}
        {visibleEducation.length > 0 && (
          <div className="cv-section mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1" style={{ color: 'var(--cv-executive-accent)' }}>
              {t.education || 'Education'}
            </h2>
            <div className="space-y-3">
              {visibleEducation.map((edu) => (
                <div key={edu.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">
                      {edu.degree}{edu.degree && edu.field ? ' in ' : ''}{edu.field}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                      {edu.startDate && edu.endDate
                        ? `${edu.startDate} – ${edu.endDate}`
                        : edu.endDate || edu.startDate || ''}
                    </span>
                  </div>
                  {edu.school && (
                    <p className="text-gray-600 text-sm">
                      {edu.school}{edu.location ? `, ${edu.location}` : ''}
                      {edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
                    </p>
                  )}
                  {edu.description && (
                    <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-700">
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

        {/* Projects */}
        {visibleProjects.length > 0 && (
          <div className="cv-section mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1" style={{ color: 'var(--cv-executive-accent)' }}>
              {t.projects || 'Projects'}
            </h2>
            <div className="space-y-3">
              {visibleProjects.map((project) => (
                <div key={project.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-gray-900">{project.name}</span>
                      {project.technologies && (
                        <span className="text-xs text-gray-500 ml-1.5">({project.technologies})</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                      {project.startDate && project.endDate
                        ? `${project.startDate} – ${project.endDate}`
                        : project.startDate || project.endDate || ''}
                    </span>
                  </div>
                  {project.description && (
                    <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-700">
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

        {/* Research */}
        {visibleResearch.length > 0 && (
          <div className="cv-section mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1" style={{ color: 'var(--cv-executive-accent)' }}>
              {t.research || 'Research & Publications'}
            </h2>
            <div className="space-y-3">
              {visibleResearch.map((entry) => (
                <div key={entry.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-gray-900">{entry.title}</span>
                      {entry.publisher && (
                        <span className="text-gray-600">, {entry.publisher}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-3">{entry.date}</span>
                  </div>
                  {entry.authors && (
                    <p className="text-xs text-gray-500 italic">{entry.authors}</p>
                  )}
                  {entry.description && (
                    <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-700">
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
      </div>
    </div>
  );
}
