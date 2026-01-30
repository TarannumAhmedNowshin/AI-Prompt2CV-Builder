'use client';

import React, { useState } from 'react';
import { FileText, Bold, Italic, Underline, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import CVSection from './CVSection';
import { HeadingEditModal } from './CVSection';

interface SummarySectionProps {
  summary: string;
  sectionTitle: string;
  onSummaryChange: (summary: string) => void;
  onTitleChange: (title: string) => void;
}

export default function SummarySection({
  summary,
  sectionTitle,
  onSummaryChange,
  onTitleChange,
}: SummarySectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingHeading, setIsEditingHeading] = useState(false);

  return (
    <>
      <CVSection
        icon={<FileText className="h-5 w-5" />}
        title={sectionTitle}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onEditHeading={() => setIsEditingHeading(true)}
      >
        <div className="space-y-2">
          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-white border border-gray-200 border-b-0 rounded-t-lg">
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <Bold className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <Italic className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <Underline className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <List className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <LinkIcon className="h-4 w-4" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded bg-gray-100">
              <AlignLeft className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <AlignCenter className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <AlignRight className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>
          
          <textarea
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            placeholder="Write a compelling summary about yourself, your experience, and career goals..."
            rows={5}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <p className="text-xs text-gray-500">
            💡 Tip: Keep your summary concise (2-3 sentences) and highlight your key strengths.
          </p>
        </div>
      </CVSection>

      {/* Heading Edit Modal */}
      <HeadingEditModal
        isOpen={isEditingHeading}
        onClose={() => setIsEditingHeading(false)}
        title="Edit Section Heading"
        value={sectionTitle}
        onChange={onTitleChange}
      />
    </>
  );
}
