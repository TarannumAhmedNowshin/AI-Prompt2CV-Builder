'use client';

import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import MinimalTemplate from './MinimalTemplate';
import { TemplateProps } from './templateUtils';

export type TemplateType = 'modern' | 'classic' | 'executive' | 'minimal';

interface TemplateInfo {
  id: TemplateType;
  name: string;
  description: string;
  features: string[];
  Component: React.ComponentType<TemplateProps>;
  previewStyle: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with a navy accent bar. Clean, structured, with skill badges.',
    features: ['Navy accent bar', 'Skill pill tags', 'Left-aligned header'],
    Component: ModernTemplate,
    previewStyle: 'bg-white border-t-4 border-[#1e3a5f]',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless serif typography in the Harvard/Stanford tradition. ATS-friendly.',
    features: ['Serif typography', 'Centered header', 'Traditional layout'],
    Component: ClassicTemplate,
    previewStyle: 'bg-white border border-gray-300',
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Two-column sidebar layout. Skills and contact on the left, content on the right.',
    features: ['Charcoal sidebar', 'Two-column layout', 'Corporate style'],
    Component: ExecutiveTemplate,
    previewStyle: 'bg-white flex overflow-hidden',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with generous whitespace. Lightweight typography, no visual noise.',
    features: ['Light font weights', 'Maximum whitespace', 'Zero accent color'],
    Component: MinimalTemplate,
    previewStyle: 'bg-white',
  },
];

export function getTemplateComponent(templateId: TemplateType): React.ComponentType<TemplateProps> {
  const template = TEMPLATES.find(t => t.id === templateId);
  return template?.Component || ModernTemplate;
}

interface TemplateSelectorProps {
  selected: TemplateType | null;
  onSelect: (template: TemplateType) => void;
  mode: 'full' | 'compact';
}

export default function TemplateSelector({ selected, onSelect, mode }: TemplateSelectorProps) {
  if (mode === 'compact') {
    return (
      <div className="grid grid-cols-4 gap-3">
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelect(tmpl.id)}
            className={`p-3 border-2 rounded-xl transition-all duration-200 ${
              selected === tmpl.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`aspect-[1/1.4] rounded-lg mb-2 shadow-inner ${tmpl.previewStyle}`}>
              {tmpl.id === 'executive' && (
                <>
                  <div className="w-[35%] h-full bg-gray-700 rounded-l-lg" />
                  <div className="flex-1" />
                </>
              )}
            </div>
            <p className="font-semibold text-center text-xs text-slate-800">{tmpl.name}</p>
            {selected === tmpl.id && (
              <p className="text-[10px] text-primary-600 mt-0.5 text-center font-medium">Active</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Select a template to get started with your CV</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelect(tmpl.id)}
            className="group p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex gap-5">
              <div className={`w-36 h-48 rounded-lg flex-shrink-0 shadow-md ${tmpl.previewStyle}`}>
                {tmpl.id === 'executive' && (
                  <>
                    <div className="w-[35%] h-full bg-gray-700 rounded-l-lg" />
                    <div className="flex-1" />
                  </>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{tmpl.description}</p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {tmpl.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600 text-xs">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <span className="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg group-hover:bg-blue-700 transition-colors">
                    Select Template
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
