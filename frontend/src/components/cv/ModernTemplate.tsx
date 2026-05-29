'use client';

import { TemplateProps, normalizeCVData, parseBulletPoints } from './templateUtils';

export default function ModernTemplate({ data }: TemplateProps) {
  const cv = normalizeCVData(data);
  const { personalInfo, summary, experience, education, skills, projects, research, languages, awards } = cv;
  const t = cv.sectionTitles || {};

  const visibleExperience = experience.filter(e => e.isVisible !== false);
  const visibleEducation = education.filter(e => e.isVisible !== false);
  const visibleProjects = projects?.filter(p => p.isVisible !== false) || [];
  const visibleResearch = research?.filter(r => r.isVisible !== false) || [];

  const contactParts: string[] = [];
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo.website) contactParts.push(personalInfo.website);

  return (
    <div
      className="cv-print-optimized bg-white shadow-lg font-sans"
      style={{
        width: '100%',
        maxWidth: '850px',
        minHeight: '1100px',
        margin: '0 auto',
        padding: '0',
        borderTop: '4px solid var(--cv-modern-accent)',
      }}
    >
      <div style={{ padding: '2rem 2.25rem 1.75rem' }}>
        {/* Header */}
        <div className="cv-section mb-4">
          <h1 className="text-2xl font-bold tracking-wide mb-0.5" style={{ color: 'var(--cv-modern-accent)' }}>
            {personalInfo.fullName || 'Your Name'}
          </h1>
          {personalInfo.professionalTitle && (
            <p className="text-sm text-gray-500 mb-1.5">{personalInfo.professionalTitle}</p>
          )}
          {contactParts.length > 0 && (
            <p className="text-xs text-gray-500 tracking-wide">
              {contactParts.join('  |  ')}
            </p>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-1.5 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
              {t.summary || 'Summary'}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Experience */}
        {visibleExperience.length > 0 && (
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
              {t.experience || 'Experience'}
            </h2>
            <div className="space-y-3">
              {visibleExperience.map((exp) => (
                <div key={exp.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-gray-900">{exp.jobTitle || 'Position'}</span>
                      {exp.employer && (
                        <span className="text-gray-600 font-normal"> at {exp.employer}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {exp.startDate && exp.endDate
                        ? `${exp.startDate} – ${exp.endDate}`
                        : exp.startDate || exp.endDate || ''}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-xs text-gray-500">{exp.location}</p>
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
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
              {t.education || 'Education'}
            </h2>
            <div className="space-y-3">
              {visibleEducation.map((edu) => (
                <div key={edu.id} className="text-sm">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {edu.degree}{edu.degree && edu.field ? ' in ' : ''}{edu.field}
                      </span>
                      {edu.gpa && (
                        <span className="text-gray-500 text-xs ml-1">(GPA: {edu.gpa})</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {edu.startDate && edu.endDate
                        ? `${edu.startDate} – ${edu.endDate}`
                        : edu.endDate || edu.startDate || ''}
                    </span>
                  </div>
                  {edu.school && (
                    <p className="text-gray-600 text-sm">{edu.school}{edu.location ? `, ${edu.location}` : ''}</p>
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
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
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
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
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
                  {project.link && (
                    <p className="text-xs text-gray-500 mt-0.5">{project.link}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research */}
        {visibleResearch.length > 0 && (
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
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
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{entry.date}</span>
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

        {/* Skills — pill badges */}
        {skills.length > 0 && (
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-2 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
              {t.skills || 'Skills'}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span
                  key={skill.id || idx}
                  className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: 'var(--cv-modern-accent-light)',
                    color: 'var(--cv-modern-accent)',
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-1.5 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
              {t.languages || 'Languages'}
            </h2>
            <p className="text-sm text-gray-700">
              {languages.map(l => `${l.name} (${l.proficiency})`).join('  |  ')}
            </p>
          </div>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <div className="cv-section mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-1.5 pb-1"
              style={{ color: 'var(--cv-modern-accent)', borderBottom: '1px solid var(--cv-modern-accent-light)' }}
            >
              {t.awards || 'Awards & Honors'}
            </h2>
            <div className="space-y-1">
              {awards.map((award, idx) => (
                <div key={idx} className="text-sm flex justify-between items-baseline">
                  <div>
                    <span className="font-medium text-gray-900">{award.title}</span>
                    <span className="text-gray-600"> — {award.issuer}</span>
                  </div>
                  {award.date && (
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{award.date}</span>
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
