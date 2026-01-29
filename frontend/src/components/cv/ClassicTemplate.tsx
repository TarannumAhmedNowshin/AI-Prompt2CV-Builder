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

interface ClassicTemplateProps {
  data: CVData;
}

export default function ClassicTemplate({ data }: ClassicTemplateProps) {
  const skillsList = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [];
  const experienceList = data.experience ? data.experience.split('\n').filter(e => e.trim()) : [];
  const educationList = data.education ? data.education.split('\n').filter(e => e.trim()) : [];

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden" style={{ width: '100%', maxWidth: '800px', minHeight: '1000px', margin: '0 auto' }}>
      <div className="p-8">
        {/* Header Section */}
        <div className="text-center border-b-4 border-gray-800 pb-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {data.fullName || 'Your Name'}
          </h1>
          <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>•</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>•</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experienceList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">
              Work Experience
            </h2>
            <div className="space-y-4">
              {experienceList.map((exp, idx) => (
                <div key={idx} className="ml-2">
                  <div className="flex gap-2">
                    <span className="text-gray-900 font-semibold">•</span>
                    <p className="text-gray-700 flex-1">{exp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {educationList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">
              Education
            </h2>
            <div className="space-y-4">
              {educationList.map((edu, idx) => (
                <div key={idx} className="ml-2">
                  <div className="flex gap-2">
                    <span className="text-gray-900 font-semibold">•</span>
                    <p className="text-gray-700 flex-1">{edu}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skillsList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">
              Skills
            </h2>
            <div className="ml-2">
              <p className="text-gray-700 leading-relaxed">
                {skillsList.join(' • ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
