'use client';

import React, { useState } from 'react';
import { X, Check, AlertTriangle, User, Mail, Phone, MapPin, Wrench, Linkedin } from 'lucide-react';
import { ParsedCVData } from './DocumentDropzone';
import Button from '../ui/Button';

interface ParsedDataPreviewProps {
  data: ParsedCVData;
  onApply: (data: ParsedCVData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// Confidence indicator component
function ConfidenceIndicator({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  let color = 'bg-red-500';
  let textColor = 'text-red-700';
  
  if (percentage >= 70) {
    color = 'bg-green-500';
    textColor = 'text-green-700';
  } else if (percentage >= 40) {
    color = 'bg-yellow-500';
    textColor = 'text-yellow-700';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{percentage}%</span>
    </div>
  );
}

// Field preview component
function FieldPreview({ 
  icon: Icon, 
  label, 
  value, 
  confidence,
  onToggle,
  isSelected = true 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  confidence?: number;
  onToggle?: () => void;
  isSelected?: boolean;
}) {
  if (!value) return null;

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-primary-50 border-primary-200' 
          : 'bg-slate-50 border-slate-200 opacity-60'
      }`}
      onClick={onToggle}
    >
      <div className={`flex-shrink-0 p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-slate-200'}`}>
        <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-600' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
          {confidence !== undefined && <ConfidenceIndicator score={confidence} />}
        </div>
        <p className="text-sm text-slate-700 mt-1 break-words">{value}</p>
      </div>
      <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
        isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white border-slate-300'
      }`}>
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
    </div>
  );
}

export default function ParsedDataPreview({ data, onApply, onCancel, isOpen }: ParsedDataPreviewProps) {
  // Track which fields are selected for import
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set([
    'full_name', 'email', 'phone', 'location', 'linkedin'
  ]));
  const [selectedSkills, setSelectedSkills] = useState<Set<number>>(
    new Set(data.skills.map((_, i) => i))
  );

  const toggleField = (field: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(field)) {
      newSelected.delete(field);
    } else {
      newSelected.add(field);
    }
    setSelectedFields(newSelected);
  };

  const toggleSkill = (index: number) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleApply = () => {
    // Filter data based on selections
    const filteredData: ParsedCVData = {
      ...data,
      full_name: selectedFields.has('full_name') ? data.full_name : '',
      email: selectedFields.has('email') ? data.email : '',
      phone: selectedFields.has('phone') ? data.phone : '',
      location: selectedFields.has('location') ? data.location : '',
      linkedin: selectedFields.has('linkedin') ? data.linkedin : '',
      website: '',
      summary: '',
      experience: [],
      education: [],
      skills: data.skills.filter((_, i) => selectedSkills.has(i)),
      projects: [],
    };
    onApply(filteredData);
  };

  const selectAllSkills = () => {
    setSelectedSkills(new Set(data.skills.map((_, i) => i)));
  };

  const deselectAllSkills = () => {
    setSelectedSkills(new Set());
  };

  if (!isOpen) return null;

  const overallConfidence = data.confidence_scores?.overall || 0;
  const hasAnyData = data.full_name || data.email || data.phone || data.location || data.skills.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Review Extracted Data</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select what to import into your CV
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overall Confidence Banner */}
        {hasAnyData && (
          <div className={`px-5 py-3 flex items-center gap-3 ${
            overallConfidence >= 0.6 ? 'bg-green-50' : overallConfidence >= 0.3 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            {overallConfidence < 0.5 && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
            <span className="text-sm text-slate-700">
              Extraction confidence: <strong>{Math.round(overallConfidence * 100)}%</strong>
            </span>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!hasAnyData ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-slate-700 font-medium">Could not extract data</p>
              <p className="text-sm text-slate-500 mt-1">
                The document format may not be supported or the content is not recognized.
              </p>
            </div>
          ) : (
            <>
              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <FieldPreview 
                    icon={User}
                    label="Full Name" 
                    value={data.full_name} 
                    confidence={data.confidence_scores?.full_name}
                    isSelected={selectedFields.has('full_name')}
                    onToggle={() => toggleField('full_name')}
                  />
                  <FieldPreview 
                    icon={Mail}
                    label="Email" 
                    value={data.email}
                    confidence={data.confidence_scores?.email}
                    isSelected={selectedFields.has('email')}
                    onToggle={() => toggleField('email')}
                  />
                  <FieldPreview 
                    icon={Phone}
                    label="Phone" 
                    value={data.phone}
                    confidence={data.confidence_scores?.phone}
                    isSelected={selectedFields.has('phone')}
                    onToggle={() => toggleField('phone')}
                  />
                  <FieldPreview 
                    icon={MapPin}
                    label="Location" 
                    value={data.location}
                    confidence={data.confidence_scores?.location}
                    isSelected={selectedFields.has('location')}
                    onToggle={() => toggleField('location')}
                  />
                  <FieldPreview 
                    icon={Linkedin}
                    label="LinkedIn" 
                    value={data.linkedin}
                    isSelected={selectedFields.has('linkedin')}
                    onToggle={() => toggleField('linkedin')}
                  />
                </div>
              </div>

              {/* Skills */}
              {data.skills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Skills ({data.skills.length} found)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={selectAllSkills}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={deselectAllSkills}
                        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSkill(index)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedSkills.has(index)
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 opacity-60'
                        }`}
                      >
                        {skill.name}
                        {selectedSkills.has(index) && (
                          <Check className="h-3 w-3 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            disabled={!hasAnyData || (selectedFields.size === 0 && selectedSkills.size === 0)}
          >
            <Check className="h-4 w-4" />
            Apply Selected
          </Button>
        </div>
      </div>
    </div>
  );
}
