'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Lightbulb, X, Plus, GripVertical } from 'lucide-react';
import CVSection from './CVSection';
import { HeadingEditModal } from './CVSection';

export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface SkillsSectionProps {
  skills: Skill[];
  sectionTitle: string;
  onSkillsChange: (skills: Skill[]) => void;
  onTitleChange: (title: string) => void;
}

export default function SkillsSection({
  skills,
  sectionTitle,
  onSkillsChange,
  onTitleChange,
}: SkillsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.trim(),
    };
    onSkillsChange([...skills, skill]);
    setNewSkill('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (id: string) => {
    onSkillsChange(skills.filter((skill) => skill.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    
    const draggedIndex = skills.findIndex((s) => s.id === draggedId);
    const targetIndex = skills.findIndex((s) => s.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newSkills = [...skills];
    const [draggedSkill] = newSkills.splice(draggedIndex, 1);
    newSkills.splice(targetIndex, 0, draggedSkill);
    
    onSkillsChange(newSkills);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <>
      <CVSection
        icon={<Lightbulb className="h-5 w-5" />}
        title={sectionTitle}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onEditHeading={() => setIsEditingHeading(true)}
      >
        <div className="space-y-4">
          {/* Skills Tags */}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                draggable
                onDragStart={() => handleDragStart(skill.id)}
                onDragOver={(e) => handleDragOver(e, skill.id)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors cursor-move ${
                  draggedId === skill.id ? 'opacity-50' : ''
                }`}
              >
                <GripVertical className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>{skill.name}</span>
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter..."
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {skills.length === 0 && (
            <p className="text-center text-gray-500 py-2 text-sm">
              No skills added yet. Type a skill above to get started.
            </p>
          )}
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
