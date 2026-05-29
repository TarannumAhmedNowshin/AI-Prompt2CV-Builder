'use client';

import { TemplateProps, normalizeCVData, parseBulletPoints } from './templateUtils';

export default function MinimalTemplate({ data }: TemplateProps) {
  const cv = normalizeCVData(data);
  const { personalInfo, summary, experience, education, skills, projects, research, languages, awards } = cv;
  const t = cv.sectionTitles || {};

  const visibleExperience = experience.filter(e => e.isVisible !== false);
  const visibleEducation = education.filter(e => e.isVisible !== false);
  const visibleProjects = projects?.filter(p => p.isVisible !== false) || [];
  const visibleResearch = research?.filter(r => r.isVisible !== false) || [];

  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);
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
        padding: '3rem 2.75rem',
        fontWeight: 300,
      }}
    >
      {/* Header — minimal, airy */}
      <div className="cv-section mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-wide mb-1">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        {personalInfo.professionalTitle && (
          <p className="text-sm text-gray-400 font-light tracking-wide mb-2">{personalInfo.professionalTitle}</p>
        )}
        {contactParts.length > 0 && (
          <p className="text-xs text-gray-400 tracking-wide">
            {contactParts.join('  /  ')}
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">
            {t.summary || 'About'}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed font-light">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {visibleExperience.length > 0 && (
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">
            {t.experience || 'Experience'}
          </h2>
          <div className="space-y-4">
            {visibleExperience.map((exp) => (
              <div key={exp.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-gray-900">{exp.jobTitle || 'Position'}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {exp.startDate && exp.endDate
                      ? `${exp.startDate} – ${exp.endDate}`
                      : exp.startDate || exp.endDate || ''}
                  </span>
                </div>
                {exp.employer && (
                  <p className="text-sm text-gray-500 font-light">
                    {exp.employer}{exp.location ? `, ${exp.location}` : ''}
                  </p>
                )}
                {exp.description && (
                  <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-600 font-light">
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
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">
            {t.education || 'Education'}
          </h2>
          <div className="space-y-3">
            {visibleEducation.map((edu) => (
              <div key={edu.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-gray-900">
                    {edu.degree}{edu.degree && edu.field ? ' in ' : ''}{edu.field}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {edu.startDate && edu.endDate
                      ? `${edu.startDate} – ${edu.endDate}`
                      : edu.endDate || edu.startDate || ''}
                  </span>
                </div>
                {edu.school && (
                  <p className="text-sm text-gray-500 font-light">
                    {edu.school}{edu.location ? `, ${edu.location}` : ''}
                    {edu.gpa ? ` — ${edu.gpa}` : ''}
                  </p>
                )}
                {edu.description && (
                  <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-600 font-light">
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
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">
            {t.projects || 'Projects'}
          </h2>
          <div className="space-y-3">
            {visibleProjects.map((project) => (
              <div key={project.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-medium text-gray-900">{project.name}</span>
                    {project.technologies && (
                      <span className="text-xs text-gray-400 ml-1.5">({project.technologies})</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {project.startDate && project.endDate
                      ? `${project.startDate} – ${project.endDate}`
                      : project.startDate || project.endDate || ''}
                  </span>
                </div>
                {project.description && (
                  <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-600 font-light">
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
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">
            {t.research || 'Research'}
          </h2>
          <div className="space-y-3">
            {visibleResearch.map((entry) => (
              <div key={entry.id} className="text-sm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="font-medium text-gray-900">{entry.title}</span>
                    {entry.publisher && (
                      <span className="text-gray-500 font-light">, {entry.publisher}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{entry.date}</span>
                </div>
                {entry.authors && (
                  <p className="text-xs text-gray-400 font-light">{entry.authors}</p>
                )}
                {entry.description && (
                  <ul className="mt-1 pl-4 list-disc space-y-0.5 text-sm text-gray-600 font-light">
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

      {/* Skills */}
      {skills.length > 0 && (
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">
            {t.skills || 'Skills'}
          </h2>
          <p className="text-xs text-gray-500 font-light leading-relaxed">
            {skills.map(s => s.name).join(', ')}
          </p>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">
            {t.languages || 'Languages'}
          </h2>
          <p className="text-xs text-gray-500 font-light">
            {languages.map(l => `${l.name} (${l.proficiency})`).join('  /  ')}
          </p>
        </div>
      )}

      {/* Awards */}
      {awards && awards.length > 0 && (
        <div className="cv-section mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">
            {t.awards || 'Awards'}
          </h2>
          <div className="space-y-1">
            {awards.map((award, idx) => (
              <div key={idx} className="text-sm flex justify-between items-baseline">
                <div>
                  <span className="font-medium text-gray-800">{award.title}</span>
                  <span className="text-gray-400 font-light"> — {award.issuer}</span>
                </div>
                {award.date && (
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{award.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
