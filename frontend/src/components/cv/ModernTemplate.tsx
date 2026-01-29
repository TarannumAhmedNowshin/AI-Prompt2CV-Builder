interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

interface ModernTemplateProps {
  data: CVData;
}

export default function ModernTemplate({ data }: ModernTemplateProps) {
  const skillsList = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
  const experienceList = data.experience ? data.experience.split('\n').filter(e => e.trim()) : [];
  const educationList = data.education ? data.education.split('\n').filter(e => e.trim()) : [];

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: '800px', minHeight: '1000px', margin: '0 auto' }}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">
          {data.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm">
          {data.email && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {data.email}
            </span>
          )}
          {data.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {data.phone}
            </span>
          )}
          {data.location && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {data.location}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experienceList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
              Experience
            </h2>
            <div className="space-y-3">
              {experienceList.map((exp, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-blue-300">
                  <p className="text-gray-700">{exp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educationList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
              Education
            </h2>
            <div className="space-y-3">
              {educationList.map((edu, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-blue-300">
                  <p className="text-gray-700">{edu}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skillsList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
